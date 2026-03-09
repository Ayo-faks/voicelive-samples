const icons = require('@fluentui/react-icons');

const names = [
  'MoreHorizontalRegular',
  'MoreHorizontal24Regular',
  'Settings24Regular',
  'TextAlignLeft24Regular',
  'Shield24Regular',
  'PersonFeedback24Regular',
  'AddCircle24Regular',
  'Add24Regular',
  'ChatAdd24Regular',
];

for (const name of names) {
  const Icon = icons[name];
  if (!Icon) {
    console.log(name + ': NOT FOUND');
    continue;
  }
  const el = Icon({});
  const children = el.props && el.props.children;
  if (Array.isArray(children)) {
    children.forEach(function(c) {
      if (c && c.props && c.props.d) {
        console.log(name + ': d="' + c.props.d + '"');
      }
    });
  } else if (children && children.props && children.props.d) {
    console.log(name + ': d="' + children.props.d + '"');
  } else {
    console.log(name + ': no path data found');
  }
}
