export class Colors {
  public static ORANGE = '#ff9900';
  public static ORANGE_HOVER = '#ff99008c';
  public static BLUE = '#3366cc';
  public static BLUE_HOVER = '#3366cc8c';
  public static BLUENAVY = '#316395';
  public static BLUENAVY_HOVER = '#3163958c';
  public static GREEN = '#109618';
  public static GREEN_HOVER = '#1096188c';
  public static PINK = '#dd4477';
  public static PINK_HOVER = '#dd44778c';
  public static VIOLET = '#990099';
  public static VIOLET_HOVER = '#9900998c';
  public static AQUA = '#22aa99';
  public static AQUA_HOVER = '#22aa998c';
  public static BLACK = '#000000';
  public static BLACK_HOVER = '#0000008c';
  public static YELLOW = '#ffff00';
  public static YELLOW_HOVER = '#ffff008c';
  public static RED = '#ff0000';
  public static RED_HOVER = '#ff00008c';
  public static GREENLIGHT = '#8fd920';
  public static GREENLIGHT_HOVER = '#8fd9208c';
  public static LILLA = '#a893cf';
  public static LILLA_HOVER = '#a893cf8c';
  public static BROWN = '#a52a2a';
  public static BROWN_HOVER = '#a52a2a8c';
  public static DARKGREEN = '#1a6405';
  public static DARKGREEN_HOVER = '#1a64058c';
  public static BORDEAUX = '#d90101';
  public static BORDEAUX_HOVER = '#d901018c';
  public static SENAPE = '#c1be46';
  public static SENAPE_HOVER = '#c1be468c';
  public static DARKGREY = '#a9a9a9';
  public static DARKGREY_HOVER = '#a9a9a98c';
  public static PURPLE = '#663399';
  public static PURPLE_HOVER = '#6633998c';
  public static OLIVEGREEN = '#556b2f';
  public static OLIVEGREEN_HOVER = '#556b2f8c';
  public static FUCHSIA = '#ff00ff';
  public static FUCHSIA_HOVER = '#ff00ff8c';
  public static DIMGRAY = '#696969';
  public static DIMGRAY_HOVER = '#6969698c';
  static colorArray = new Array<any>();

  static getColor(index: number): any {
    if (this.colorArray.length == 0) {
      this.buildColorArray();
    }
    return this.colorArray[index];
  }

  private static buildColorArray() {
    this.colorArray.push(
      { color: Colors.BLUE, hoverColor: Colors.BLUE_HOVER },
      { color: Colors.PINK, hoverColor: Colors.PINK_HOVER },
      { color: Colors.ORANGE, hoverColor: Colors.ORANGE_HOVER },
      { color: Colors.GREEN, hoverColor: Colors.GREEN_HOVER },
      { color: Colors.VIOLET, hoverColor: Colors.VIOLET_HOVER },
      { color: Colors.AQUA, hoverColor: Colors.AQUA_HOVER },
      { color: Colors.YELLOW, hoverColor: Colors.YELLOW_HOVER },
      { color: Colors.DARKGREY, hoverColor: Colors.DARKGREY_HOVER },
      { color: Colors.BLUENAVY, hoverColor: Colors.BLUENAVY_HOVER },
      { color: Colors.GREENLIGHT, hoverColor: Colors.GREENLIGHT_HOVER },
      { color: Colors.LILLA, hoverColor: Colors.LILLA_HOVER },
      { color: Colors.BROWN, hoverColor: Colors.BROWN_HOVER },
      { color: Colors.BORDEAUX, hoverColor: Colors.BORDEAUX_HOVER },
      { color: Colors.DARKGREEN, hoverColor: Colors.DARKGREEN_HOVER },
      { color: Colors.SENAPE, hoverColor: Colors.SENAPE_HOVER },
      { color: Colors.BLACK, hoverColor: Colors.BLACK_HOVER },
      { color: Colors.PURPLE, hoverColor: Colors.PURPLE_HOVER },
      { color: Colors.OLIVEGREEN, hoverColor: Colors.OLIVEGREEN_HOVER },
      { color: Colors.FUCHSIA, hoverColor: Colors.FUCHSIA_HOVER },
      { color: Colors.DIMGRAY, hoverColor: Colors.DIMGRAY_HOVER }
    );
  }

  static randomColor(): string {
    return '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substring(1, 7);
  }

  static hoverColor(color: string): string {
    return color + '8c';
  }
}
