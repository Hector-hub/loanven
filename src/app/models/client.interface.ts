export interface ClientI{
    id?:string;
    name:string;
    lastName:string;
    telephones:Array<string>;
    address:string;
    reference:ReferenceI;
    loan:LoanI;
    guarantor:GuarantorI;
    active:boolean;
}   

export interface LoanI{
    amount: string;
    installments: Array<InstallmentsI>;
    interestRate: string;
    isPay:boolean;

}

export interface ReferenceI{
    nombre:string;
    telefono:string;
}


export interface GuarantorI{
    nombre:string;
    telefonos:Array<string>;
    address:string;
    workAddrees:string;
}

export interface InstallmentsI{
    week:string;
    isPay:boolean;
}