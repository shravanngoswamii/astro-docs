import type { Root } from "mdast";
import { visit } from "unist-util-visit";

type CalloutType = "note" | "tip" | "important" | "warning" | "danger";

const TYPES: Record<string, CalloutType> = {
	note: "note",
	tip: "tip",
	important: "important",
	warning: "warning",
	caution: "danger",
	danger: "danger",
};

const DEFAULT_TITLES: Record<CalloutType, string> = {
	note: "Note",
	tip: "Tip",
	important: "Important",
	warning: "Warning",
	danger: "Danger",
};

function calloutNode(
	type: CalloutType,
	titleChildren: unknown[],
	body: unknown[],
) {
	return {
		type: "paragraph",
		data: {
			hName: "aside",
			hProperties: {
				className: ["docs-callout", `docs-callout--${type}`],
				role: "note",
			},
		},
		children: [
			{
				type: "paragraph",
				data: {
					hName: "p",
					hProperties: { className: ["docs-callout-title"] },
				},
				children: titleChildren,
			},
			{
				type: "paragraph",
				data: {
					hName: "div",
					hProperties: { className: ["docs-callout-body"] },
				},
				children: body,
			},
		],
	};
}

const GH_MARKER = /^\[!(\w+)\]\s*/i;

/**
 * remark plugin: converts `:::note` container directives and GitHub-style
 * `> [!NOTE]` blockquotes into Callout markup matching `.docs-callout`.
 */
export function remarkAsides() {
	return (tree: Root) => {
		// ::: container directives
		visit(tree, (node: any) => {
			if (node.type !== "containerDirective") return;
			const type = TYPES[node.name];
			if (!type) return;
			const labelChild = node.children?.[0];
			let titleChildren: unknown[] = [
				{ type: "text", value: DEFAULT_TITLES[type] },
			];
			let body = node.children ?? [];
			if (labelChild?.data?.directiveLabel) {
				if (labelChild.children?.length) titleChildren = labelChild.children;
				body = node.children.slice(1);
			}
			const replacement = calloutNode(type, titleChildren, body);
			Object.assign(node, replacement);
		});

		// GitHub-style blockquote callouts
		visit(tree, "blockquote", (node: any) => {
			const first = node.children?.[0];
			if (first?.type !== "paragraph") return;
			const firstText = first.children?.[0];
			if (firstText?.type !== "text") return;
			const match = GH_MARKER.exec(firstText.value);
			if (!match) return;
			const type = TYPES[match[1].toLowerCase()];
			if (!type) return;

			firstText.value = firstText.value.replace(GH_MARKER, "");
			if (firstText.value === "" && first.children.length === 1) {
				node.children.shift();
			}
			const replacement = calloutNode(
				type,
				[{ type: "text", value: DEFAULT_TITLES[type] }],
				node.children,
			);
			Object.assign(node, replacement);
		});
	};
}
