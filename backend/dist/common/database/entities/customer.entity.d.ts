import { Address } from './address.entity';
import { Order } from './order.entity';
export declare class Customer {
    id: number;
    name: string;
    email: string;
    addresses: Address[];
    orders: Order[];
}
