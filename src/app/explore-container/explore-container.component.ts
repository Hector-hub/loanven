import { Component, Input } from '@angular/core';
import { BalanceService } from '../services/balance.service';
import { ClientsService } from '../services/clients.service';
import { ClientI } from '../models/client.interface';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent {

constructor(private balanceService:BalanceService,private clientsService:ClientsService){
  this.balanceService.getBalance().then((balance:any)=>{
this.balance=balance;
  })

  this.clientsService.getClients().then((clients:Array<ClientI>) => {
    clients.forEach((client:ClientI)=>{
      if(client.loan.isPay==false){
      
        this.borrowed+=client.loan.amount?parseFloat(client.loan.amount):0;
     
      }
    })
  });


}

balance:any={}
borrowed:number=0;

handleRefresh(event: any) {
  this.clientsService.getClients().then((clients:Array<ClientI>) => {
    this.borrowed=0;
    clients.forEach((client:ClientI)=>{
      if(client.loan.isPay==false){
        this.borrowed+=client.loan.amount?parseFloat(client.loan.amount):0;
      }
    })
  });

  this.balanceService.getBalance().then((balance:any)=>{
    this.balance=balance;
      })
  setTimeout(() => {
    // Any calls to load data go here
    event.target.complete();
  }, 1000);
}
  
}
