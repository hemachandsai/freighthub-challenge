import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShipmentService } from '../shipment.service';
@Component({
  selector: 'app-shipment',
  templateUrl: './shipment.component.html',
  styleUrls: ['./shipment.component.scss']
})
export class ShipmentComponent implements OnInit, OnDestroy {
  shipmentInfo: any;
  @Input("shipmentData") shipmentData: any;
  oldShipmentName: string; 
  newShipmentNmae: string;
  searchingData: boolean;
  errorReturned: boolean;
  searchId: string;
  textMessage: string;
  constructor(
    private shipmentService: ShipmentService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((route) => {
        this.searchId = route['id'];
        if(this.searchId){
          this.getShipmentInfo();
        }
    })
    if(this.shipmentData){
      this.listenForShipmentData();
    }
  }
ngOnDestroy(){ 
    this.oldShipmentName = ''; 
    this.newShipmentNmae = '';
    this.searchingData = false;
    this.errorReturned = false;
    this.searchId = '';
    this.textMessage = '';
    this.shipmentInfo =  {};
}

  listenForShipmentData(){
    this.shipmentData.subscribe((data) => {
      if(typeof(data) === 'string'){
        if(data.match(/httpStart/ig)){
          this.searchingData = true;
          this.errorReturned = false;
          this.shipmentInfo = '';
        } else if (data.match(/httpEnd/gi)){
          this.searchingData = false;
          this.errorReturned = false;
        } else if (data.match(/error/gi)){
          this.errorReturned = true;
        } else if (data.match(/id:\S+/gi)){
          console.log(data)
          this.searchId = data.split(':')[1]
        }
      } else {
          this.shipmentInfo = data;
          this.oldShipmentName = this.shipmentInfo.name;
          this.newShipmentNmae = this.shipmentInfo.name;
      }
    })
  }

  focusShipmentName(event: any){
    event.target.previousElementSibling.focus();
  }

  getShipmentInfo(){
    this.searchingData = true;
    this.errorReturned = false;
    this.shipmentService.getShipmentInfo(this.searchId).subscribe((res: any) => {
      this.shipmentInfo = res;
      this.oldShipmentName = this.shipmentInfo.name;
      this.newShipmentNmae = this.shipmentInfo.name;
    },(err) => {
      this.errorReturned = true;
    }).add(() => {
      this.searchingData = false;
    })
  }

  changeShipmentName(){
      this.shipmentService.editShipmentName(this.shipmentInfo.id, {name: this.newShipmentNmae}).subscribe((res: any) => {
        console.log(res)
        this.textMessage = 'SHIPMENT SAVED SUCCESSFULLY';
        setTimeout(() => {
          this.textMessage = '';
        }, 5000);
      });
  }

}
