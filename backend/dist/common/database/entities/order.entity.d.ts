import { Customer } from './customer.entity';
export declare class Order {
    id: number;
    customer: Customer;
    orderDate: Date;
    totalAmount: number;
}
