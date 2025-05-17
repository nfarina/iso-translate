import { LANGUAGES } from "./languages";
import { parseAnnotatedText } from "./rubyAnnotation";

// These are just examples that would be manually tested in the browser
// but they're helpful to visualize how the parsing would work

// Example 1: Japanese with furigana
const japaneseExample = "これは日本語[にほんご]の例文[れいぶん]です。";
console.log(
  "Japanese example parsed:",
  parseAnnotatedText(
    japaneseExample,
    LANGUAGES.find((l) => l.id === "ja-furigana")!,
  ),
);
// Should output something like:
// [
//   "これは",
//   { base: "日本語", reading: "にほんご" },
//   "の",
//   { base: "例文", reading: "れいぶん" },
//   "です。"
// ]

// Example 2: Chinese with pinyin
const chineseExample = "这是一个汉语[hànyǔ]例子[lìzi]。";
console.log(
  "Chinese example parsed:",
  parseAnnotatedText(
    chineseExample,
    LANGUAGES.find((l) => l.id === "zh-pinyin")!,
  ),
);
// Should output something like:
// [
//   "这是一个",
//   { base: "汉语", reading: "hànyǔ" },
//   { base: "例子", reading: "lìzi" },
//   "。"
// ]

// Example 3: English (no annotations)
const englishExample = "This is an English example.";
console.log(
  "English example parsed:",
  parseAnnotatedText(englishExample, LANGUAGES.find((l) => l.id === "en")!),
);
// Should output: ["This is an English example."]

// Example 4: Complex nested case
const complexExample = "複雑[ふくざつ]な例[れい]：「漢字[かんじ]と仮名[かな]」";
console.log(
  "Complex example parsed:",
  parseAnnotatedText(
    complexExample,
    LANGUAGES.find((l) => l.id === "ja-furigana")!,
  ),
);
// Should handle nested annotations properly
