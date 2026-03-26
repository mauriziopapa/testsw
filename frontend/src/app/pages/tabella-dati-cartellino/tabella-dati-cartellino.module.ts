import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiCartellinoRoutingModule } from './tabella-dati-cartellino-routing.module';
import { TabellaDatiCartellinoComponent } from './tabella-dati-cartellino.component';

@NgModule({
  declarations: [TabellaDatiCartellinoComponent],
  imports: [SharedModule, TabellaDatiCartellinoRoutingModule, WidgetDirective]
})
export class TabellaDatiCartellinoModule {}
