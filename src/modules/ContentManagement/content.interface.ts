export interface Icontent{
    _id: string;
    name: string;
    category: 'skin' | 'power-up' | 'achievement'|'obstacles';
    numberOfCarrot?: number; //skin
    imgUrl:string;
    timeInSec?: number; //power up
    description: string;
    status: 'active'|'locked';
    skinType?:'free'|'paid';
    targetValueInFt?:number; //acheivements
    createdAt: Date;
    updatedAt: Date;
}