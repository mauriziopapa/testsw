import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { LogisticaRoutingModule } from './logistica-routing.module';
import { LogisticaComponent } from './logistica.component';

@NgModule({
  declarations: [LogisticaComponent],
  imports: [SharedModule, LogisticaRoutingModule, WidgetDirective]
})
export class LogisticaModule {}
