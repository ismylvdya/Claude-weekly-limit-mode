# weekly-segments

A Claude Code mod that shows the weekly usage limit in the status line, split into 7 days:

```
● ･ ● ･ ● ･ ● ・ ●●●●●◐○○○○ ・ ○ ･ ○
```

Each ordinary day is one dot (1/7 of the weekly limit), today is ten dots. A dot is `○` under 10% of its share, `◐` from 10% to 75%, `●` from 75%.

`/weekly-segments` hides or shows the line.

## Install

At the prompt of a terminal Claude Code session:

```
/plugin install weekly-segments --marketplace ismylvdya/Claude-weekly-limit-mode
```

Answer `y` to add the marketplace, then pick the user scope. The mod works in sessions started afterwards; in an open one run `/reload-plugins`.

Or from the shell:

```
claude plugin marketplace add ismylvdya/Claude-weekly-limit-mode
claude plugin install weekly-segments@claude-weekly-limit-mode --scope user
```

It needs a subscription plan with a weekly limit; without one the line stays empty.
