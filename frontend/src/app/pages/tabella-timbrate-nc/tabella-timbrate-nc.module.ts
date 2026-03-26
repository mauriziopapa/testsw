import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaTimbrateNcRoutingModule } from './tabella-timbrate-nc-routing.module';
import { TabellaTimbrateNcComponent } from './tabella-timbrate-nc.component';

@NgModule({
  declarations: [TabellaTimbrateNcComponent],
  imports: [SharedModule, TabellaTimbrateNcRoutingModule, WidgetDirective]
})
export class TabellaTimbrateNcModule {}
