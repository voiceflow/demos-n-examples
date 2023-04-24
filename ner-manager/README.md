# Named-entity recognition tool
Tool to detect default named entities in utterances. Using the [winkNLP](https://github.com/winkjs/wink-nlp.git) library.

## Usage
```
npx csvner
```

![GIF Preview](./images/render.gif)

**Input**: a CSV file with intent name in the first column and utterance in the second column.
You can check the example.csv file for reference.

**Output**: this tool will generate a CSV file with intent name in the first column, and utterance with flagged entities in the second column.

```csv
quote,I need an insurance quote
welcome,Hi
welcome,Hi there!
book,I want to order {number} pizzas
book,I want to book a table for {number} people
book,In the next {duration}
book,{date} at {time}
visit,I want to visit Paris in a {duration}
contact,Sure {email} is my email
contact,You can reach me on {number} or with my email {email}
quickActions,I want to logout
```
