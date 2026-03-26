import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReportResaCaricaMediaRoutingModule } from './report-resa-carica-media-routing.module';
import { ReportResaCaricaMediaComponent } from './report-resa-carica-media.component';

@NgModule({
  declarations: [ReportResaCaricaMediaComponent],
  imports: [SharedModule, ReportResaCaricaMediaRoutingModule, WidgetDirective]
})
export class ReportResaCaricaMediaModule {}
