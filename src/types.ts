export type PromtOptions = {
  initial?: string,
  choices?: Array<{ title: string, value: any }>
  message: string,
  validate?: (params: any) => boolean,
  onCancel?: () => void,
  type: 'text' | 'select'
}