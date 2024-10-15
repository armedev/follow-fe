import { DataIgnoreType } from "./constants";

export function debounce<Params extends unknown[]>(
  func: (...args: Params) => unknown,
  timeout = 300,
): (...args: Params) => void {
  let timer: NodeJS.Timeout;
  return (...args: Params) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}

export function elemToSelector(elem: HTMLElement, depth = 10): string {
  const { tagName = "", id, className, parentNode } = elem;

  if (tagName === "HTML") return "HTML";

  let str = tagName;

  str += id !== "" ? `#${id}` : "";

  if (typeof className === "string") {
    const classes = (className || "").split(/\s/);
    for (let i = 0; i < classes.length && i < 2; i++) {
      if (typeof classes[i] === "string" && classes[i].length > 0)
        str += `.${classes[i]}`;
    }
  }

  let childIndex = 1;

  for (
    let e = elem;
    e.previousElementSibling;
    e = e.previousElementSibling as HTMLElement
  ) {
    childIndex += 1;
  }

  str += `:nth-child(${childIndex})`;

  depth--;

  return depth < 1 || parentNode == null
    ? str
    : `${elemToSelector(parentNode as HTMLElement, depth)} > ${str}`;
}

/**
 * triggers the `onChange` handler after setting the passed value
 * */
export const triggerInputChange = (node: HTMLElement, value = "") => {
  const inputTypes = [
    window.HTMLInputElement,
    window.HTMLSelectElement,
    window.HTMLTextAreaElement,
  ];
  // only process the change on elements we know have a value setter in their constructor
  if (inputTypes.indexOf(Object.getPrototypeOf(node).constructor) > -1) {
    const setValue = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(node),
      "value",
    )!.set!;

    const isSelect =
      Object.getPrototypeOf(node).constructor === window.HTMLSelectElement;

    const event = new Event(isSelect ? "change" : "input", {
      bubbles: true,
    });

    setValue.call(node, value);
    node.dispatchEvent(event);
  }
};

export const getTargetBasedOnAttr = (e: Event, attr: DataIgnoreType) => {
  const target = e.target as HTMLElement;

  if (target == null) return null;

  const ignoreAttribute = target.getAttribute("data-ignore") as DataIgnoreType;

  if (ignoreAttribute === attr) return null;

  return target;
};
