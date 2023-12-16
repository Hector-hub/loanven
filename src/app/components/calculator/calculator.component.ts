import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {CommonModule, NgFor, NgIf} from '@angular/common';
import { ClientI } from 'src/app/models/client.interface';
import { ClientsService } from 'src/app/services/clients.service';
import database from 'firebase';
import { ref, set } from 'firebase/database';
import { BalanceService } from 'src/app/services/balance.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  standalone: true,
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  imports: [NgIf,FormsModule,ReactiveFormsModule,CommonModule,NgFor],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CalculatorComponent implements OnInit {

calcular:boolean=true;
isCleanAlertOpen:boolean=false;
totalToPay:number=0;
installment:number=0;
isClientModalOpen:boolean=false;
isClientAlertOpen:boolean=false;
clients:Array<ClientI> =[];
clientSelected?:ClientI;
clientSelectedIndex:number=0;
isAlertGiveLoanOpen:boolean=false;
constructor(private clientsService:ClientsService,private storage: StorageService) {}

  calculatorForm:FormGroup =new FormGroup({
    amount: new FormControl('',[Validators.required]),
    installments: new FormControl(null,[Validators.required]),
    interestRate: new FormControl(null,[Validators.required]),
  });


  ngOnInit() {
    this.clientsService.getClients().then((clients:any) => {
      this.clients= [...clients];
    });
  }
  calculate(){
 
    if(this.calculatorForm.valid){
      this.calcular=false;
      const {amount,installments,interestRate}= this.calculatorForm.value;
      this.totalToPay=(amount*1)+(amount*(interestRate/100));
      this.installment=this.totalToPay/installments;
      this.calculatorForm.disable();
    }
   
  }

clean(){
  this.calcular=true
  this.calculatorForm.reset()
  this.totalToPay=0;
  this.installment=0;
  this.calculatorForm.enable();
}
 
giveLoan(){
 let clients=[...this.clients]; 
 let installments=[];
 for (let index = 0; index < this.calculatorForm.value['installments']; index++) {
  installments[index]= { "week": `${index}`, "isPay": false }
 }
  clients[this.clientSelectedIndex].loan.amount=this.calculatorForm.value['amount']
  clients[this.clientSelectedIndex].loan.installments=[...installments]
  clients[this.clientSelectedIndex].loan.interestRate=this.calculatorForm.value['interestRate']
  clients[this.clientSelectedIndex].loan.isPay=false

  this.clients[this.clientSelectedIndex]=clients[this.clientSelectedIndex];
  this.storage.get('ac')?.then((result:string)=>{
    set(ref(database, `${result}/clients`), [
      ...this.clients
    ]);
  })


  this.clean();
  this.setClientModalOpen(false);
  setTimeout(()=>{
    this.setGiveLoanAlertOpen(true);
  },500)



}
public alertButtonsGiveLoan = ['OK'];
public alertButtonsToSelectClient = [
  {
    text: 'Cancelar',
    role: 'cancel',
    handler: () => {
      
    },
  },
  {
    text: 'Si',
    role: 'confirm',
    handler: () => {
  this.giveLoan()
    },
  },
];


setOpenAlertSelectClient(isOpen:boolean,index?:number){
this.isClientAlertOpen=isOpen;
this.clientSelectedIndex=index?index:0;
this.clientSelected=this.clients[this.clientSelectedIndex];
}


setClientModalOpen(isOpen:boolean){
  this.clientsService.getClients().then((clients:any) => {
    this.clients= [...clients];
  });
this.isClientModalOpen = isOpen;

}

handleInput(event:any) {
  const query = event.target.value.toLowerCase();
  if(query!==''){
    this.clients = this.clients.filter((d) => d.name.toLowerCase().indexOf(query) > -1);
  }else{
    this.clientsService.getClients().then((clients:any) => {
      this.clients= [...clients];
    });
  }

}

public alertButtonsToClean = [
  {
    text: 'Cancelar',
    role: 'cancel',
    handler: () => {
      
    },
  },
  {
    text: 'Si',
    role: 'confirm',
    handler: () => {
      this.clean()
    },
  },
];
setOpen(isOpen: boolean) {
  this.isCleanAlertOpen = isOpen;
}

setGiveLoanAlertOpen(isOpen:boolean){
  this.isAlertGiveLoanOpen=isOpen;
}
}


