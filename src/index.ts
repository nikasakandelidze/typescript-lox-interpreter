import { InputSource, InputSourceFactory } from "./inputSource";
import { Lox } from "./core/lox";
import { LOX_VERSION } from "./util/constants";

const runLoxInterpreter = () => {
  const fileName = process.argv.length >= 3 ? process.argv[2] : null;
  const lox: Lox = new Lox();
  const inputSource: InputSource = fileName
    ? InputSourceFactory.createFileInputSource(fileName)
    : InputSourceFactory.createCliInputSource();
  if (fileName) {
    const input = inputSource.getInput();
    input && lox.run(input);
  } else {
    while (true) {
      const input = inputSource.getInput();
      if (!input) {
        break;
      }
      lox.run(input);
    }
  }
};

console.log(`Welcome to the Lox ${LOX_VERSION}`);
runLoxInterpreter();
