import { Customer } from './customer.entity';
export declare class Address {
    id: number;
    customer: Customer;
    type: string;
    street: string;
    city: string;
    zip: string;
    country: string;
}
