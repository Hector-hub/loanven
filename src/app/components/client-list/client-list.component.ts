import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {CommonModule, NgFor, NgIf} from '@angular/common';
import { ClientI,InstallmentsI } from 'src/app/models/client.interface';
import { ClientsService } from 'src/app/services/clients.service';
import database from 'firebase';
import { ref, set } from 'firebase/database';
import { BalanceService } from 'src/app/services/balance.service';
import { StorageService } from 'src/app/services/storage.service';


@Component({
  standalone: true,
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss'],
  imports: [NgIf,FormsModule,ReactiveFormsModule,CommonModule,NgFor],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClientListComponent implements OnInit {
  ac:string='';
  updateCount:number=0;
  clients:Array<ClientI>=[]
  isClientModalOpen:boolean=false;
  selectedClient?:ClientI;
  selectedClientIndex:number=0;
  addClientModalOpen:boolean=false;
  isAddClientAlertOpen:boolean=false;
  isDeleteClientAlertOpen:boolean=false;
  balance:any={};
  isIncompletePhones:boolean=false;
  phonesAreCorrect:boolean=false
  clientForm:any=new FormGroup({
    id:new FormControl(''),
    name: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    telephones: new FormArray([
      new FormControl('', [Validators.required])
    ]),
    address: new FormControl('', [Validators.required]),
    reference: new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      telefono: new FormControl('', [Validators.required]),
    }),
    loan: new FormGroup({
      amount: new FormControl(''),
      installments:  new FormArray([
        new FormGroup({
          week: new FormControl(''),
          isPay: new FormControl(false)
        })
      ]),
      interestRate: new FormControl(''),
      isPay: new FormControl(false),
    }),
    guarantor: new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      telefonos: new FormArray([
        new FormControl('', [Validators.required])
      ]),
      address: new FormControl('', [Validators.required]),
      workAddrees: new FormControl('', [Validators.required])
    }),
    active: new FormControl(true),
  });
constructor(private clientsService:ClientsService, private balanceService:BalanceService,private storage: StorageService) {
  this.storage.get('ac')?.then((result:string)=>{
    this.ac=result
  })
}

ngOnInit() {
  this.clientsService.getClients().then((clients:any) => {
    this.clients= [...clients];
  });
  this.storage.get('ac')?.then((result:string)=>{
    this.ac=result
  })
}
ngAfterViewChecked(){
 if(this.updateCount===0){
  this.clientsService.getClients().then((clients:any) => {
    this.clients= [...clients];
  });

  this.clientForm=new FormGroup({
    id:new FormControl(''),
    name: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    telephones: new FormArray([
      new FormControl('', [Validators.required])
    ]),
    address: new FormControl('', [Validators.required]),
    reference: new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      telefono: new FormControl('', [Validators.required]),
    }),
    loan: new FormGroup({
      amount: new FormControl(''),
      installments:  new FormArray([
        new FormGroup({
          week: new FormControl(''),
          isPay: new FormControl(false)
        })
      ]),
      interestRate: new FormControl(''),
      isPay: new FormControl(false),
    }),
    guarantor: new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      telefonos: new FormArray([
        new FormControl('', [Validators.required])
      ]),
      address: new FormControl('', [Validators.required]),
      workAddrees: new FormControl('', [Validators.required])
    }),
    active: new FormControl(true),
  });
  this.updateCount=1;
 }

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


setClientModalOpen(isOpen:boolean,index:number){
  this.isClientModalOpen = isOpen;
this.selectedClient=this.clients[index]
this.selectedClientIndex=index;
this.updateCount=0;
  }

  getWeekAmount(amount:string='',interestRate:string='', installments:Array<any>=[]){
    return (parseFloat(amount)+(parseFloat(amount)*(parseFloat(interestRate)/100)))/installments.length
  }
  getWeekProfit(amount:string='',interestRate:string='', installments:Array<any>=[]){
    return ((parseFloat(amount)*(parseFloat(interestRate)/100)))/installments.length
  }

  payWeek(index:number,isPay:boolean){
    let client:any= this.selectedClient;
    client!.loan!.installments[index].isPay=!isPay;
    let isLoanPay= client!.loan!.installments.every((installment:InstallmentsI)=>{
    return installment.isPay==true
    })
    client!.loan!.isPay=isLoanPay;
    this.clients[this.selectedClientIndex]=client;

    this.balanceService.getBalance(this.ac).then((balance:any) => {

      const weekAmount=this.getWeekProfit(this.selectedClient?.loan?.amount,this.selectedClient?.loan?.interestRate,this.selectedClient?.loan?.installments);
      const profits=client!.loan!.installments[index].isPay?parseFloat(balance?.profits)+weekAmount:parseFloat(balance?.profits)-weekAmount;
      set(ref(database, `${this.ac}/balance`), {
        profits:profits
      }).then(()=>{
        set(ref(database, `${this.ac}/clients`), [...this.clients]);
      })
    });


  }

  submitFormClient(){
    if(this.clientForm.value.telephones[0]===''){
      this.clientForm.value.telephones?.shift();
    }

    if( this.clientForm.value.guarantor?.telefonos[0]===''){
      this.clientForm.value.guarantor?.telefonos?.shift();
    }
    if(this.clientForm?.value?.loan?.installments.length>0){
      if(this.clientForm?.value?.loan?.installments[0]?.week===''){
        this.clientForm.value.loan?.installments?.shift();
      }
    
    }
    this.phonesAreCorrect=this.clientForm.value?.telephones?.length>0 && this.clientForm.value.guarantor?.telefonos?.length>0;
  
  
    if(this.clientForm.value['id']===''){
   
      if(this.phonesAreCorrect){
        this.clientsService.addClient(this.clientForm.value,this.clients);
        this.telephones.clear();
    this.guarantorTelephones.clear();
    this.installments.clear();
    this.clientForm.reset();
    this.addClientModalOpen=false;
    this.selectedClient=undefined;
    this.selectedClientIndex=0;
    this.phonesAreCorrect=false;
    this.clientsService.getClients().then((clients:any) => {
      this.clients= [...clients];
    });
      }else{
    
        this.setOpenAlertIsIncomplete(true)
      }

  
    }else{
      this.clients[this.selectedClientIndex]=this.clientForm.value;
    
      if(this.phonesAreCorrect){
        set(ref(database, `${this.ac}/clients`), [
          ...this.clients
        ]);
        this.telephones.clear();
    this.guarantorTelephones.clear();
    this.installments.clear();
    this.clientForm.reset();
    this.addClientModalOpen=false;
    this.selectedClient=undefined;
    this.selectedClientIndex=0;
    this.phonesAreCorrect=false
    this.clientsService.getClients().then((clients:any) => {
      this.clients= [...clients];
    });
      }else{
        this.setOpenAlertIsIncomplete(true)
      }
   
    }
    

  }
  get telephones() {
    return this.clientForm.get('telephones') as FormArray;
  }
  get guarantorTelephones() {
    return this.clientForm.get('guarantor.telefonos') as FormArray;
  }
  get installments() {
    return this.clientForm.get('loan.installments') as FormArray;
  }

  addTelephone(event:any) {
    if(event.target.previousElementSibling.value!==''){
      this.telephones.push(new FormControl(event.target.previousElementSibling.value, [Validators.required]));
    }
  
  }

  removeTelephone(index: number) {
    this.telephones.removeAt(index);
  }

  addGuarantorTelephone(event:any) {
    if(event.target.previousElementSibling.value!==''){
    this.guarantorTelephones.push(new FormControl(event.target.previousElementSibling.value, [Validators.required]));
  }
    // event.target.previousElementSibling.value=''
  
  }

  removeGuarantorTelephone(index: number) {
    this.guarantorTelephones.removeAt(index);
  }
  

  setAddClientModalOpen(isOpen:boolean){
    this.addClientModalOpen=isOpen;
    this.updateCount=0;
  }

  handleRefresh(event: any) {
    this.clientsService.getClients().then((clients:any) => {
      this.clients= [...clients];
    });
    setTimeout(() => {
      // Any calls to load data go here
      event.target.complete();
    }, 1000);
  }
  public alertIsIncompleteButtons = ['OK'];
  public alertButtonsToAddClient = [
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
    this.submitFormClient()
      },
    },
  ];
  
  setOpenAlertAddClient(isOpen:boolean){
    this.isAddClientAlertOpen=isOpen
  }
  public alertButtonsToDeleteClient = [
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
    this.deleteClient(this.selectedClientIndex)
      },
    },
  ];
  setOpenAlertDeleteClient(isOpen:boolean,index:number=0){

this.selectedClientIndex=index;
this.isDeleteClientAlertOpen=isOpen;
  }

  editClient(){
    this.isClientModalOpen=false;

let client:ClientI={
  
  id:this.clients[this.selectedClientIndex]['id'],
  name: this.clients[this.selectedClientIndex]['name'],
  lastName:this.clients[this.selectedClientIndex]['lastName'],
  telephones: [],
  address: this.clients[this.selectedClientIndex]['address'],
  reference: this.clients[this.selectedClientIndex]['reference'],
  loan: {
    amount:this.clients[this.selectedClientIndex]['loan']['amount'],
    installments:[],
    interestRate:this.clients[this.selectedClientIndex]['loan']['interestRate'],
    isPay:this.clients[this.selectedClientIndex]['loan']['isPay']
  },
  guarantor: {
    nombre:this.clients[this.selectedClientIndex]['guarantor']['nombre'],
    address:this.clients[this.selectedClientIndex]['guarantor']['address'],
    telefonos:[],
    workAddrees:this.clients[this.selectedClientIndex]['guarantor']['workAddrees']
  },
  active:true
}

    
    this.clientForm.patchValue(client)
if(
  this.clients[this.selectedClientIndex]['loan']['installments']?.length>0){
    this.clients[this.selectedClientIndex]['loan']['installments'].forEach((installment:any)=>{
      console.log(installment);
      this.installments.push(new FormControl({...installment}, [Validators.required]));
    })
  }
if(this.clients[this.selectedClientIndex]['telephones']?.length>0){
  this.clients[this.selectedClientIndex]['telephones'].forEach((tel:any)=>{
    this.telephones.push(new FormControl(tel, [Validators.required]));
  })
}

if(this.clients[this.selectedClientIndex]['guarantor']['telefonos']?.length>0){
  this.clients[this.selectedClientIndex]['guarantor']['telefonos'].forEach((tel:any)=>{
    this.guarantorTelephones.push(new FormControl(tel, [Validators.required]));
  })

}

 
  
    setTimeout(()=>{
      this.addClientModalOpen=true
    },500)
    this.clientsService.getClients().then((clients:any) => {
      this.clients= [...clients];
    });
  }

  deleteClient(index:number){
    this.clients[index].active=false;
    this.clients[index].loan.isPay=true;
    set(ref(database, `${this.ac}/clients`), [
      ...this.clients
    ]);
    this.updateCount=0;
  }
  setOpenAlertIsIncomplete(isOpen:boolean){
    this.isIncompletePhones=isOpen
  }
}


