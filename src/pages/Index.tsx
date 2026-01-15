import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'referral';
  amount: number;
  status: 'success' | 'pending' | 'rejected';
  date: Date;
}

const Index = () => {
  const [balance, setBalance] = useState(15247.83);
  const [profit24h, setProfitH24] = useState(1616.27);
  const [totalInvested, setTotalInvested] = useState(50000);
  const [totalWithdrawn, setTotalWithdrawn] = useState(8340);
  const [referrals, setReferrals] = useState({ total: 47, active: 32, income: 11750 });
  const [depositAmount, setDepositAmount] = useState(10000);
  const [calculatorAmount, setCalculatorAmount] = useState([25000]);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [bonusProgress, setBonusProgress] = useState({ chatJoined: true, referralsCount: 18 });

  const transactions: Transaction[] = [
    { id: '1', type: 'profit', amount: 530, status: 'success', date: new Date() },
    { id: '2', type: 'referral', amount: 2500, status: 'success', date: new Date(Date.now() - 3600000) },
    { id: '3', type: 'deposit', amount: 10000, status: 'success', date: new Date(Date.now() - 7200000) },
    { id: '4', type: 'withdrawal', amount: 5000, status: 'pending', date: new Date(Date.now() - 10800000) },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBalance(prev => prev + (totalInvested * 0.106 / 86400));
      setProfitH24(prev => prev + 0.01);
    }, 1000);
    return () => clearInterval(interval);
  }, [totalInvested]);

  const calculateDailyProfit = (amount: number) => (amount * 0.106).toFixed(2);
  const calculateMonthlyProfit = (amount: number) => (amount * 0.106 * 30).toFixed(2);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return 'ArrowDownToLine';
      case 'withdrawal': return 'ArrowUpFromLine';
      case 'profit': return 'TrendingUp';
      case 'referral': return 'Users';
      default: return 'CircleDollarSign';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-success/20 text-success border-success/30';
      case 'pending': return 'bg-warning/20 text-warning border-warning/30';
      case 'rejected': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted';
    }
  };

  const StatCard = ({ title, value, icon, gradient = false }: { title: string; value: string | number; icon: string; gradient?: boolean }) => (
    <Card className={`p-6 ${gradient ? 'gradient-card' : 'bg-card/50 backdrop-blur border-border/50'} hover:scale-105 transition-all duration-300 animate-fade-in`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${gradient ? 'gradient-primary' : 'bg-primary/10'}`}>
          <Icon name={icon} className="w-6 h-6 text-white" />
        </div>
        <Icon name="TrendingUp" className="w-4 h-4 text-success" />
      </div>
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <p className={`text-3xl font-bold ${gradient ? 'text-gradient' : ''}`}>
        {typeof value === 'number' ? `${value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽` : value}
      </p>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-2">Invest Passive</h1>
          <p className="text-muted-foreground">Платформа пассивного инвестирования</p>
        </header>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-card/50 backdrop-blur p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:gradient-primary">
              <Icon name="LayoutDashboard" className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Главная</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:gradient-primary">
              <Icon name="Briefcase" className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Портфель</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:gradient-primary">
              <Icon name="Wallet" className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Кошелек</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="data-[state=active]:gradient-primary">
              <Icon name="Users" className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Партнеры</span>
            </TabsTrigger>
            <TabsTrigger value="bonuses" className="data-[state=active]:gradient-primary">
              <Icon name="Gift" className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Бонусы</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:gradient-primary">
              <Icon name="User" className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Профиль</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Баланс" value={balance} icon="Wallet" gradient />
              <StatCard title="Прибыль 24ч" value={profit24h} icon="TrendingUp" />
              <StatCard title="Партнеры" value={`${referrals.active}/${referrals.total}`} icon="Users" />
              <StatCard title="Выведено" value={totalWithdrawn} icon="ArrowUpFromLine" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 gradient-card">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="Zap" className="w-5 h-5" />
                  Быстрые действия
                </h3>
                <div className="space-y-3">
                  <Button onClick={() => setShowDepositDialog(true)} className="w-full gradient-primary text-white hover:opacity-90">
                    <Icon name="Plus" className="w-4 h-4 mr-2" />
                    Пополнить баланс
                  </Button>
                  <Button onClick={() => setShowWithdrawDialog(true)} variant="outline" className="w-full border-primary/50 hover:bg-primary/10">
                    <Icon name="ArrowUpFromLine" className="w-4 h-4 mr-2" />
                    Вывести средства
                  </Button>
                  <Button variant="outline" className="w-full border-accent/50 hover:bg-accent/10" onClick={() => window.open('https://t.me/+tDcs_yy5mcU4MTgx', '_blank')}>
                    <Icon name="MessageCircle" className="w-4 h-4 mr-2" />
                    Перейти на форум
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="Clock" className="w-5 h-5" />
                  История операций
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon name={getTransactionIcon(tx.type)} className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{tx.amount.toLocaleString('ru-RU')} ₽</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(tx.status)}>
                        {tx.status === 'success' ? 'Успешно' : tx.status === 'pending' ? 'Ожидание' : 'Отменено'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Всего вложено" value={totalInvested} icon="PiggyBank" gradient />
              <StatCard title="Активные депозиты" value={1} icon="Activity" />
              <StatCard title="Доход в сутки" value={totalInvested * 0.106} icon="TrendingUp" />
            </div>

            <Card className="p-6 gradient-card">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Icon name="Calculator" className="w-5 h-5" />
                Калькулятор доходности
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base">Сумма инвестиции</Label>
                    <span className="text-2xl font-bold text-gradient">{calculatorAmount[0].toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <Slider
                    value={calculatorAmount}
                    onValueChange={setCalculatorAmount}
                    min={1000}
                    max={1000000}
                    step={1000}
                    className="mb-8"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-2">Прибыль в день</p>
                    <p className="text-2xl font-bold text-primary">{calculateDailyProfit(calculatorAmount[0])} ₽</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                    <p className="text-sm text-muted-foreground mb-2">Прибыль в месяц</p>
                    <p className="text-2xl font-bold text-secondary">{calculateMonthlyProfit(calculatorAmount[0])} ₽</p>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <p className="text-sm text-muted-foreground mb-2">Процентная ставка</p>
                    <p className="text-2xl font-bold text-accent">10.6%</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Активный депозит</h3>
                <Badge className="gradient-primary text-white">Активен</Badge>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Сумма депозита</span>
                  <span className="font-bold text-xl">{totalInvested.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Накоплено процентов</span>
                  <span className="font-bold text-xl text-success">{(balance - totalInvested + totalWithdrawn).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Срок действия</span>
                    <span className="text-sm font-semibold">15 дней из 30</span>
                  </div>
                  <Progress value={50} className="h-3" />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <Card className="p-6 gradient-card">
              <h3 className="text-2xl font-bold mb-2">Доступно к выводу</h3>
              <p className="text-4xl font-bold text-gradient mb-4">{(balance - totalInvested).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</p>
              <p className="text-sm text-muted-foreground mb-6">Минимальная сумма вывода: 100 ₽</p>
              <Button onClick={() => setShowWithdrawDialog(true)} className="w-full gradient-primary text-white hover:opacity-90" disabled={balance - totalInvested < 100}>
                <Icon name="ArrowUpFromLine" className="w-4 h-4 mr-2" />
                Вывести средства
              </Button>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="CreditCard" className="w-5 h-5" />
                Реквизиты для вывода
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Банковская карта</p>
                    <p className="text-sm text-muted-foreground">**** 1234</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Icon name="Edit" className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="outline" className="w-full">
                  <Icon name="Plus" className="w-4 h-4 mr-2" />
                  Добавить метод вывода
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Всего рефералов" value={referrals.total} icon="Users" gradient />
              <StatCard title="Активных" value={referrals.active} icon="UserCheck" />
              <StatCard title="Доход" value={referrals.income} icon="DollarSign" />
            </div>

            <Card className="p-6 gradient-card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Link" className="w-5 h-5" />
                Реферальная ссылка
              </h3>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value="https://invest-passive.com/ref/USER123"
                  className="bg-background/50"
                />
                <Button className="gradient-primary text-white">
                  <Icon name="Copy" className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                <Icon name="Info" className="w-4 h-4 inline mr-1" />
                Получайте 25% от депозита каждого приглашенного друга
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <h3 className="text-xl font-bold mb-4">Ваши рефералы</h3>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                        <span className="text-white font-bold">U{i + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold">User {i + 1}</p>
                        <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 30)} дней назад</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">+{(Math.random() * 5000).toFixed(0)} ₽</p>
                      <p className="text-xs text-muted-foreground">Доход</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="bonuses" className="space-y-6">
            <Card className="p-6 gradient-card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Gift" className="w-5 h-5" />
                Вступить в чат проекта
              </h3>
              {bonusProgress.chatJoined ? (
                <div className="flex items-center gap-3">
                  <Icon name="CheckCircle" className="w-6 h-6 text-success" />
                  <div>
                    <p className="font-semibold">Выполнено!</p>
                    <p className="text-sm text-muted-foreground">Начислено: 100 ₽</p>
                  </div>
                </div>
              ) : (
                <Button className="w-full gradient-primary text-white" onClick={() => window.open('https://t.me/+tDcs_yy5mcU4MTgx', '_blank')}>
                  <Icon name="MessageCircle" className="w-4 h-4 mr-2" />
                  Вступить в чат (+100 ₽)
                </Button>
              )}
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Users" className="w-5 h-5" />
                Пригласить 25 друзей
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Прогресс</span>
                  <span className="font-bold">{bonusProgress.referralsCount} / 25</span>
                </div>
                <Progress value={(bonusProgress.referralsCount / 25) * 100} className="h-3" />
                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <p className="text-sm text-muted-foreground">Награда за выполнение</p>
                  <p className="text-2xl font-bold text-secondary">2000 ₽</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6 gradient-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                  <Icon name="User" className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">User #12345</h3>
                  <p className="text-muted-foreground">Участник с 15 января 2026</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground">Telegram ID</p>
                  <p className="font-semibold">@invest_user</p>
                </div>
                <div className="p-4 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground">Статус</p>
                  <Badge className="gradient-primary text-white mt-1">Активный</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <h3 className="text-xl font-bold mb-4">Контакты</h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://t.me/Invest_Pasive', '_blank')}>
                  <Icon name="MessageCircle" className="w-4 h-4 mr-2" />
                  Написать админу
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://t.me/+tDcs_yy5mcU4MTgx', '_blank')}>
                  <Icon name="Users" className="w-4 h-4 mr-2" />
                  Чат проекта
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl">Пополнение баланса</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Сумма пополнения</Label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">Номер карты для пополнения:</p>
              <p className="font-mono text-lg font-bold">1234 5678 9012 3456</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm">
                <Icon name="Info" className="w-4 h-4 inline mr-1" />
                После оплаты нажмите "Проверить оплату"
              </p>
            </div>
            <Button className="w-full gradient-primary text-white">
              <Icon name="CheckCircle" className="w-4 h-4 mr-2" />
              Проверить оплату
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl">Вывод средств</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Сумма вывода</Label>
              <Input type="number" placeholder="Минимум 100 ₽" className="mt-2" />
            </div>
            <div>
              <Label>Номер карты</Label>
              <Input placeholder="1234 5678 9012 3456" className="mt-2" />
            </div>
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm">
                <Icon name="AlertCircle" className="w-4 h-4 inline mr-1" />
                Заявка будет обработана в течение 24 часов
              </p>
            </div>
            <Button className="w-full gradient-primary text-white">
              <Icon name="Send" className="w-4 h-4 mr-2" />
              Подать заявку
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
