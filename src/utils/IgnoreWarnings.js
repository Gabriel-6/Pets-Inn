import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested inside plain ScrollViews with the same orientation',
  'Erro ao obter reservas por data: Reservas não encontradas.',
  'Warning: Each child in a list should have a unique "key" prop.'
]);