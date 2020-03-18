import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ShipmentService } from '../shipment.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  trackingID: string;
  showError: boolean;
  @Output() shipmentData = new EventEmitter();
  constructor(
    public shipmentService: ShipmentService
  ) { }

  ngOnInit() {
  }
  handleEnterKey(event){
    console.log(event)
    if(event.keyCode === 13){
      this.getShipmentDetails();
    }
  }
  getShipmentDetails(){
    if(!this.trackingID){
      this.showError = true;
      setTimeout(() => {
        this.showError = false;
      }, 3000)
      return false;
    }
    this.trackingID = this.trackingID.toUpperCase();
    this.shipmentData.emit('id:'+ this.trackingID)
    this.shipmentData.emit('httpStart')
    this.shipmentService.getShipmentInfo(this.trackingID).subscribe((res) => {
      this.shipmentData.emit(res)
    },(err) => {
      this.shipmentData.emit('error');
    }).add(() => {
      this.shipmentData.emit('httpEnd');
    })
  }
}
