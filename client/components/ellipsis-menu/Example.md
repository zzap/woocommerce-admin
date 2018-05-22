```jsx
const noop = () => {};

<EllipsisMenu label="Choose which analytics to display">
	<MenuTitle>Display Stats</MenuTitle>
	<MenuItem onInvoke={ noop }>A menu item</MenuItem>
	<MenuItem onInvoke={ noop }>A menu item</MenuItem>
	<MenuItem onInvoke={ noop }>A menu item</MenuItem>
</EllipsisMenu>
```
