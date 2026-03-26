import { CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaAumentoMpFornitoriRoutingModule } from './tabella-aumento-mp-fornitori-routing.module';
import { TabellaAumentoMpFornitoriComponent } from './tabella-aumento-mp-fornitori.component';
import { PercentagePipe } from 'src/app/shared/percent-pipe/percent.pipe';

@NgModule({
  declarations: [TabellaAumentoMpFornitoriComponent],
  imports: [SharedModule, TabellaAumentoMpFornitoriRoutingModule, WidgetDirective],
  providers: [CurrencyPipe, PercentagePipe]
})
export class TabellaAumentoMpFornitoriModule {}
