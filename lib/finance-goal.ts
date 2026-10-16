export type MoneyGoal={goal_amount:number,goal_date:string,card_amount:number,card_paid:boolean};
export function goalProgress(balance:number|null,goal:MoneyGoal,today:string){
 if(balance===null||!Number.isFinite(balance)||!Number.isFinite(goal.goal_amount)||goal.goal_amount<=0||!Number.isFinite(goal.card_amount)||goal.card_amount<0)return null;
 const [year,month]=today.split('-').map(Number),[endYear,endMonth]=goal.goal_date.split('-').map(Number);
 const months=Math.max(0,(endYear-year)*12+endMonth-month);
 const deduction=goal.card_paid?0:goal.card_amount,adjusted=balance-deduction,remaining=Math.max(0,goal.goal_amount-adjusted);
 return {balance,adjusted,deduction,remaining,percent:Math.max(0,Math.min(100,adjusted/goal.goal_amount*100)),grossPercent:Math.max(0,Math.min(100,balance/goal.goal_amount*100)),months,monthly:months>0?Math.ceil(remaining/months):null};
}
