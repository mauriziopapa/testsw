import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { AssessmentRoutingModule } from './assessment-routing.module';
import { AssessmentComponent } from './assessment.component';

@NgModule({
  declarations: [AssessmentComponent],
  imports: [SharedModule, AssessmentRoutingModule, WidgetDirective]
})
export class AssessmentModule {}
