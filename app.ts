import app from "ags/gtk4/app";
import style from "./style.scss";
import Bar from "./widget/Bar";
import { execAsync } from "ags/process";

app.start({
  css: style,
  main() {
    app.get_monitors().map(Bar);
  },
  requestHandler(argv: string[], response: (response: string) => void) {
    const [cmd] = argv;
    if (cmd == "reload-colors") {
      execAsync(["sass", "style.scss"])
        .then((css) => app.apply_css(css, true))
        .catch((e) => print(`Error applying CSS: ${e}`));
      return response("reloaded colors");
    }
    response("unknown command");
  },
});
