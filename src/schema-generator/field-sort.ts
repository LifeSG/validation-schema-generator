import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import { ICheckboxSchema, IRadioSchema } from "../fields";
import { TComponentSchema, TRenderRules, TSectionsSchema } from "./types";

export const getFieldSortOrder = (sections: TSectionsSchema): Record<string, number> => {
	let dependencies: Record<string, string[]> = {};

	Object.values(sections).forEach(({ children }) => {
		dependencies = { ...dependencies, ...generateFieldDependencies(children) };
	});

	const sorted = topologicalSort(dependencies);
	return sorted.reduce<Record<string, number>>((acc, entry, i) => {
		acc[entry] = i;
		return acc;
	}, {});
};

const generateFieldDependencies = (childrenSchema: Record<string, TComponentSchema>) => {
	let dependencies: Record<string, string[]> = {};

	Object.entries(childrenSchema).forEach(([id, componentSchema]) => {
		dependencies[id] = [];

		(componentSchema.showIf as TRenderRules[])?.forEach((renderRules) =>
			Object.entries(renderRules).forEach(([sourceFieldId, ruleGroup]) => {
				if (ruleGroup.find((rule) => rule.shown)) {
					dependencies[id].push(sourceFieldId);
				}
			})
		);

		switch (componentSchema.uiType) {
			case "checkbox":
			case "radio":
				(componentSchema as ICheckboxSchema | IRadioSchema).options.forEach((option) => {
					if (!isEmpty(option.children) && isObject(option.children)) {
						dependencies = { ...dependencies, ...generateFieldDependencies(option.children) };
					}
				});
				break;
			default:
				if (!isEmpty(componentSchema.children) && isObject(componentSchema.children)) {
					dependencies = {
						...dependencies,
						...generateFieldDependencies(componentSchema.children as Record<string, TComponentSchema>),
					};
				}
				break;
		}
	});

	return dependencies;
};

const topologicalSort = (dependencies: Record<string, string[]>) => {
	const fieldIds = Object.keys(dependencies);

	// initialise graph representation
	const edges: Record<string, string[]> = Object.fromEntries(fieldIds.map((id) => [id, []]));
	Object.entries(dependencies).forEach(([childId, parentIds]) => {
		parentIds.forEach((parentId) => {
			if (!edges[parentId]) {
				edges[parentId] = [];
			}
			edges[parentId].push(childId);
		});
	});

	const indegrees: Record<string, number> = Object.fromEntries(Object.keys(edges).map((id) => [id, 0]));
	Object.entries(dependencies).forEach(([nodeId, parentIds]) => {
		indegrees[nodeId] = parentIds.length;
	});

	// begin graph traversal
	const queue = [];
	const order = [];

	for (const [nodeId, count] of Object.entries(indegrees)) {
		if (count === 0) {
			queue.push(nodeId);
		}
	}

	while (queue.length > 0) {
		const nodeId = queue.shift();
		order.push(nodeId);

		for (const childId of edges[nodeId]) {
			indegrees[childId] -= 1;
			if (indegrees[childId] === 0) {
				queue.push(childId);
			}
		}
	}

	if (order.length !== Object.keys(edges).length) {
		console.warn("cycle detected");
	}

	return order;
};
