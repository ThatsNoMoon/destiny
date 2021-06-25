import { xml, Ref, Component } from "../mod.js";
import { getElementData } from "./elementData.js";
import { describeType } from "../utils/describeType.js";
import { ReactiveValue } from "../reactive/ReactiveValue/ReactiveValue.js";
import { isRenderable } from "../typeChecks/isRenderable.js";
import { componentOrComponentModule } from "./componentOrComponentModule.js";
import type { Renderable } from "../parsing/Renderable.js";

export class DestinyFallback extends Component {
  static override captureProps = true;
  override forwardProps = new Ref();

  #view = new ReactiveValue<Renderable>(xml``);

  constructor () {
    super();
    queueMicrotask(async () => {
      const props = getElementData(this)!.prop;
      const fallback = props.get("fallback");
      if (fallback) {
        if (!isRenderable(fallback)) {
          throw new TypeError(`Incorect type ${describeType(fallback)} for prop:fallback: Renderable expected`);
        }
        this.#view.value = fallback;
      }
      try {
        const module = await props.get("for");
        const component = componentOrComponentModule(module);

        this.#view.value = xml`
          <${component}
            destiny:ref=${this.forwardProps}
            destiny:mount=${(element: HTMLElement) => element.append(...this.childNodes)}
          />
        `;
      } catch (error) {
        const exceptionHandler = props.get("catch");
        if (exceptionHandler) {
          if (typeof exceptionHandler !== "function") {
            throw new TypeError(`Uncallable type ${describeType(exceptionHandler)} provided for prop:error as the exception handler. Expected type is (error: Error) => Renderable.`);
          }
          const template: unknown = exceptionHandler(error);
          if (!isRenderable(template)) {
            throw new TypeError(`Exception handler for prop:error retrned ${describeType(template)}, but Renderable was expected.`);
          }
          this.#view.value = template;
        } else {
          throw error;
        }
      }
    });
  }

  override template = this.#view;
}
