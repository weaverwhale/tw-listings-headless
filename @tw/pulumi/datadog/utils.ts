import { DashboardWidget } from '@pulumi/datadog/types/output';

export function setPos(pos, widget: Partial<DashboardWidget>): Partial<DashboardWidget> {
  const layout = widget.widgetLayout;
  const width = layout.width;
  const total = 12;
  widget.widgetLayout.x = pos.x;
  widget.widgetLayout.y = pos.y;
  if (pos.x * (total / width) > total) {
    pos.x = 0;
    pos.y++;
  } else {
    pos.x += width;
  }
  return widget;
}
