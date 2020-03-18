import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ShipmentListComponent } from './shipment-list/shipment-list.component';
import { ShipmentComponent } from './shipment/shipment.component';


const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'shipments/getall', component: ShipmentListComponent},
  { path: 'shipment/:id/edit', component: ShipmentComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
