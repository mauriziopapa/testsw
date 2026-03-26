import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaZohoTasksRoutingModule } from './tabella-zoho-tasks-routing.module';
import { TabellaZohoTasksComponent } from './tabella-zoho-tasks.component';

@NgModule({
  declarations: [TabellaZohoTasksComponent],
  imports: [SharedModule, TabellaZohoTasksRoutingModule, WidgetDirective]
})
export class TabellaZohoTasksModule {}
