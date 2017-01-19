# erector-set
A tool for creating project generators

## <a name="usage"></a>Usage

Install this package

```shell
npm i -S erector-set
```

And use it in a file

```javascript
const erectorSet = require('erector-set');

const questions = [
    { name: 'animal', question: 'Enter an animal:' },
    { name: 'unused', question: 'What\'s your age?' },
    { name: 'animalId', transform: convertSpaces, useAnswer: 'animal' }
];
const templates = [
    { destination: './animal-story.txt', template: 'My favorite animal is a(n) {{ animal }} (id: {{ animalId }})' },
    { destination: './sub/{{ animalId }}-file' }
];

const convertSpaces = value => {
    return value.replace(/\s/g, '_');
};

erectorSet.build(questions, templates);
```

When run, this will prompt the user similar to the following:

```shell
Enter an animal: Tiger Shark
What's your age? 24
```

Given the above answers, it would produce the following file structure:

```shell
|_sub/
| |_TigerShark-file
|_animal-story.txt
```

The file in `sub/TigerShark-file` would be empty since there was no `template` provided while the contents
of `animal-story.txt` would be:

```shell
My favorite animal is a(n) Tiger Shark (id: TigerShark)
```

## Methods

* `build(questions, templates)`: asks the provided `questions`, performs string replacements on
    `templates` based on those answers, then outputs those files; returns a Promise
* `construct(answers, templates)`: function to perform string replacement on template `templates`
    based on the `answers`
* `inquire(questions)`: tool used by `build` to ask `questions`; returns a Promise

## Data Structures

### Questions

The questions to ask a user should be provided as an **Array** of **Objects** with the following
structure:

- `allowBlank`: if truthy, will allow blank answers
- `name` (_required_): an ID, unique to the set of questions
- `question`: the **String** prompt to show the user
- `transform`: a **Function** to transform the user's input; method signature is
    `transformMethod(value, allAnswers)` where `allAnswers` is the **Array** of answers up until that
    point.
- `useAnswer`: if a question is not provided, this attribute can be provided to use another question's
    answer. **Make sure these questions are at the end of the list of questions!**

### Templates

The templates should be provided as an **Array** of **Objects** with the following structure:

- `check`: a function to see if the file should be created; if omitted or not a Function, it
    defaults to true.
- `destination` (_required_): the file path to create. Note that `destination` values are run
    through the same template variable-replacement as the `template` values. This means your
    can output variable file names.
- `template`: the string to do replacements on; if this is omitted, a blank file will be created.
    This can also be a file path to a template; if it is, the file will be read and used for
    replacements.

## Template Format

The `template.template` value is a **String** which can either point to a file location or be the template
itself. The format of templates uses a variable scheme similar to [Angular](https://angular.io/ "Angular") or
[Vue](http://vuejs.org/ "Vue.js"), as shown in the following example:

```html
<html>
    <body>
        <h1>{{ myHeader }}</h1>
    </body>
</html>
```

In this template, the question named `myHeader` would be replaced with the answer to that question. It is
important to remember **any `{{ }}`-wrapped strings that DO NOT have a matching answer will not be replaced.**
This was done purposefully to allow accurate generation of libraries which use such a syntax.