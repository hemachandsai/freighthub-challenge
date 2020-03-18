import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ShipmentService } from '../shipment.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-shipment-list',
  templateUrl: './shipment-list.component.html',
  styleUrls: ['./shipment-list.component.scss']
})
export class ShipmentListComponent implements OnInit {

  shipmentList = [];
  searchString = '_sort=id&_order=asc&_page=1&_limit=20';
  paginationIndexes = [];
  lastPage: number;
  currentPage: number;
  httpCall: boolean;
  constructor(
    public shipmentService: ShipmentService,
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      if(params.page){
        this.getAllShipments(this.searchString.replace(/page=\d+/, 'page=' + params.page));
        this.currentPage = Number(params.page);
        console.log("currentpage", this.currentPage)
      } else {
        this.currentPage = 1;
        this.getAllShipments(this.searchString)
      }
    })
  }
  getAllShipments(searchString){
    this.shipmentList = []
    this.httpCall = true;
    this.shipmentService.getAllShipmentInfo(searchString).subscribe((resp: any) => {
      this.shipmentList = [...resp.body];
      this.searchString = searchString;
      const headers = resp.headers.keys();
      let linkHeader: string;
      console.log(headers)
      headers.map((name) => {
        if(name.match(/link/gi)){
            linkHeader = resp.headers.get(name);
        }
      })
      if(linkHeader){
        linkHeader.split(', ').map((singleLine) => {
          if(singleLine.match(/last/gi)){
            this.lastPage = Number(singleLine.match(/page=\d+/gi)[0].replace('page=',''));
            console.log("lastpage ", this.lastPage)
            this.generatePaginationIndexes();
          }
        });
      }
    }).add(() => {
      this.httpCall = false;
    });
  }
  getMatchingShipments(event){
    console.log(event.target.previousElementSibling.value)
    if(!event.target.previousElementSibling.value){
      return false;
    }
    this.httpCall = true;
    this.shipmentService.getMatchingShipments(event.target.previousElementSibling.value).subscribe((res: any) => {
      this.shipmentList = res;
    }).add(() => {
      this.httpCall = false;
    });
  }
  sort(index){
    let searchString: string;
    switch(index){
      case 1:
        searchString = '_sort=id&_order=';
        break;
      case 2:
        searchString = '_sort=name&_order=';
        break;
      case 3:
        searchString = '_sort=origin&_order=';
        break;
      case 4:
        searchString = '_sort=destination&_order=';
        break;
      case 5:
        searchString = '_sort=total&_order=';
        break;
      case 6:
        searchString = '_sort=status&_order=';
        break;
      case 7:
        searchString = '_sort=id&_order=';
        break;
    }
    this.searchString.match(/asc/gi) ? searchString += 'desc' : searchString += 'asc';
    this.getAllShipments(searchString);
  }
  generatePaginationIndexes(){
    this.paginationIndexes = []
    for(let i=this.currentPage; i < this.currentPage + 10; i++){
        if(i <= this.lastPage){
          this.paginationIndexes.push(i)
        }
    }
  }
  navigate(data: string){
    console.log(this.currentPage, this.currentPage+1)
    if(data === 'next'){
        if(this.currentPage < this.lastPage){
          this.router.navigate(['/shipments/getall'],{  relativeTo: this.activatedRoute, queryParams: { page: this.currentPage + 1}})
        }
    } else if(data === 'previous'){
      if(this.currentPage > 1){
        this.router.navigate(['/shipments/getall'],{  relativeTo: this.activatedRoute, queryParams: { page: this.currentPage - 1}})
      }
    } else {
      if(Number(data) <= this.lastPage){
        this.router.navigate(['/shipments/getall'],{ relativeTo: this.activatedRoute ,queryParams: { page: data}})
      }
    }
  }
}
