import { NgModule } from '@angular/core';
import { AcquistiComponent } from './acquisti.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AcquistiRoutingModule } from './acquisti-routing.module';
import { WidgetDirective } from 'src/app/directives/widget.directive';

@NgModule({
  declarations: [AcquistiComponent],
  imports: [SharedModule, AcquistiRoutingModule, WidgetDirective]
})
export class AcquistiModule {}
