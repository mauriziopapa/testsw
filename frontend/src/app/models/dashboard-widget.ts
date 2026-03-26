export class DashboardWidgets {
  iddashboard = 0;
  iduserdashboard = 0;
  idwidget_instance = 0;
  idwidget = 0;
  name = '';
  url = '';
  ass_pos = 0;
  position = 0;

  constructor(widget_instance: number, position: number) {
    this.idwidget_instance = widget_instance;
    this.position = position;
  }
}
