import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaCommesseNcRoutingModule } from './tabella-commesse-nc-routing.module';
import { TabellaCommesseNcComponent } from './tabella-commesse-nc.component';

@NgModule({
  declarations: [TabellaCommesseNcComponent],
  imports: [SharedModule, TabellaCommesseNcRoutingModule, WidgetDirective]
})
export class TabellaCommesseNcModule {}
