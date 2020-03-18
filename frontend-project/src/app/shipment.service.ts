import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ShipmentService {
  appUrl: string = environment.url;
  constructor(
    public http: HttpClient
  ) { }

  getShipmentInfo(id :string){
      return this.http.get(this.appUrl + 'shipments/' + id)
      .pipe(catchError(this.handleError));
  }

  getAllShipmentInfo(searchString: string){
      return this.http.get(this.appUrl + 'shipments?' + searchString, { observe: 'response' })
      .pipe(catchError(this.handleError));
  }

  getMatchingShipments(matchString: string){
    return this.http.get(this.appUrl + 'shipments?q=' + matchString)
    .pipe(catchError(this.handleError));
  }
  
  editShipmentName(shipmentId: string, data: any){
    return this.http.patch(this.appUrl + 'shipments/'+shipmentId, data)
    .pipe(catchError(this.handleError));
  }
  handleError(e){
    console.log("Error at service layer: ", e)
    return throwError(new Error(e))
  }
}
