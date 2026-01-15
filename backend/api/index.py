import json
import os
import psycopg2
from datetime import datetime
import secrets
import string
import requests

def handler(event: dict, context) -> dict:
    """API для управления балансом, транзакциями и бонусами пользователей"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        db_url = os.environ['DATABASE_URL']
        schema = os.environ['MAIN_DB_SCHEMA']
        conn = psycopg2.connect(db_url, options=f'-c search_path={schema}')
        cur = conn.cursor()
        
        path = event.get('queryStringParameters', {}).get('action', '')
        body_str = event.get('body', '{}')
        
        if method == 'POST' and path == 'get_user':
            body = json.loads(body_str) if body_str else {}
            telegram_id = body.get('telegram_id')
            username = body.get('username', '')
            
            if not telegram_id:
                return create_response(400, {'error': 'telegram_id required'})
            
            cur.execute("SELECT id, telegram_id, username, balance, total_invested, total_withdrawn, referral_code, chat_bonus_claimed FROM users WHERE telegram_id = %s", (telegram_id,))
            user = cur.fetchone()
            
            if not user:
                ref_code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
                cur.execute(
                    "INSERT INTO users (telegram_id, username, referral_code) VALUES (%s, %s, %s) RETURNING id, telegram_id, username, balance, total_invested, total_withdrawn, referral_code, chat_bonus_claimed",
                    (telegram_id, username, ref_code)
                )
                user = cur.fetchone()
                conn.commit()
            
            cur.execute("SELECT SUM(amount) FROM deposits WHERE user_id = %s AND status = 'active'", (user[0],))
            active_deposits = cur.fetchone()[0] or 0
            
            cur.execute("SELECT COUNT(*), COUNT(CASE WHEN total_invested > 0 THEN 1 END), COALESCE(SUM(bonus_amount), 0) FROM referrals r JOIN users u ON r.referred_id = u.id WHERE r.referrer_id = %s", (user[0],))
            ref_stats = cur.fetchone()
            
            cur.execute("SELECT id, type, amount, status, created_at FROM transactions WHERE user_id = %s ORDER BY created_at DESC LIMIT 10", (user[0],))
            transactions = [
                {
                    'id': str(tx[0]),
                    'type': tx[1],
                    'amount': float(tx[2]),
                    'status': tx[3],
                    'date': tx[4].isoformat()
                }
                for tx in cur.fetchall()
            ]
            
            result = {
                'id': user[0],
                'telegram_id': user[1],
                'username': user[2],
                'balance': float(user[3]),
                'total_invested': float(user[4]),
                'total_withdrawn': float(user[5]),
                'referral_code': user[6],
                'chat_bonus_claimed': user[7],
                'active_deposits': float(active_deposits),
                'referrals': {
                    'total': ref_stats[0],
                    'active': ref_stats[1],
                    'income': float(ref_stats[2])
                },
                'transactions': transactions
            }
            
            cur.close()
            conn.close()
            return create_response(200, result)
        
        elif method == 'POST' and path == 'claim_chat_bonus':
            body = json.loads(body_str) if body_str else {}
            telegram_id = body.get('telegram_id')
            
            if not telegram_id:
                return create_response(400, {'error': 'telegram_id required'})
            
            cur.execute("SELECT id, chat_bonus_claimed FROM users WHERE telegram_id = %s", (telegram_id,))
            user = cur.fetchone()
            
            if not user:
                return create_response(404, {'error': 'User not found'})
            
            if user[1]:
                return create_response(400, {'error': 'Bonus already claimed'})
            
            bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
            if bot_token:
                chat_id = '@invest_passive_chat'
                check_url = f'https://api.telegram.org/bot{bot_token}/getChatMember'
                response = requests.get(check_url, params={'chat_id': chat_id, 'user_id': telegram_id})
                
                if response.status_code == 200:
                    data = response.json()
                    status = data.get('result', {}).get('status', '')
                    
                    if status not in ['member', 'administrator', 'creator']:
                        return create_response(400, {'error': 'Not subscribed to chat'})
            
            cur.execute("UPDATE users SET balance = balance + 100, chat_bonus_claimed = TRUE WHERE id = %s RETURNING balance", (user[0],))
            new_balance = cur.fetchone()[0]
            
            cur.execute("INSERT INTO transactions (user_id, type, amount, status) VALUES (%s, 'bonus', 100, 'success')", (user[0],))
            conn.commit()
            
            cur.close()
            conn.close()
            return create_response(200, {'success': True, 'new_balance': float(new_balance)})
        
        elif method == 'POST' and path == 'create_deposit':
            body = json.loads(body_str) if body_str else {}
            telegram_id = body.get('telegram_id')
            amount = body.get('amount', 0)
            
            if not telegram_id or amount <= 0:
                return create_response(400, {'error': 'Invalid data'})
            
            cur.execute("SELECT id FROM users WHERE telegram_id = %s", (telegram_id,))
            user = cur.fetchone()
            
            if not user:
                return create_response(404, {'error': 'User not found'})
            
            cur.execute("INSERT INTO deposits (user_id, amount) VALUES (%s, %s)", (user[0], amount))
            cur.execute("UPDATE users SET total_invested = total_invested + %s WHERE id = %s", (amount, user[0]))
            cur.execute("INSERT INTO transactions (user_id, type, amount, status) VALUES (%s, 'deposit', %s, 'pending')", (user[0], amount))
            conn.commit()
            
            cur.close()
            conn.close()
            return create_response(200, {'success': True})
        
        else:
            cur.close()
            conn.close()
            return create_response(404, {'error': 'Endpoint not found'})
    
    except Exception as e:
        return create_response(500, {'error': str(e)})

def create_response(status_code: int, body: dict) -> dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body),
        'isBase64Encoded': False
    }