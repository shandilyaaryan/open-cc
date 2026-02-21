import { BorderChars } from "@opentui/core";
import { darkOnly as theme } from "../theme";

type HeaderProps = {
  title: string;
  stats: string;
};

export const Header = (props: HeaderProps) => (
  <box
    flexDirection="row"
    justifyContent="space-between"
    marginTop={1}
    marginLeft={1}
    marginRight={1}
    paddingTop={1}
    paddingBottom={1}
    paddingLeft={2}
    paddingRight={1}
    backgroundColor={theme.backgroundPanel}
    border={["left"]}
    borderColor={theme.border}
    customBorderChars={{
      ...BorderChars.single,
      vertical: "┃",
    }}
  >
    <text fg={theme.text}>
      <b>#</b> {props.title}
    </text>
    <text fg={theme.textMuted}>{props.stats}</text>
  </box>
);
