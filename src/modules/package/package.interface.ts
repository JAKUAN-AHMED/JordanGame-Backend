// package.interface.ts
export interface IPackage{
    _id: string;
    name: string;
    price: number;
    amount: number;
    currency: string;
    description: string;
    status: 'active'|'inactive';
    createdAt: Date;
    updatedAt: Date;
}