import { Component } from '@angular/core';
import { ClientI } from '../models/client.interface';
import { ClientsService } from '../services/clients.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(private clientsService:ClientsService) {}

}
