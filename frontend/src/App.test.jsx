import { render, screen } from '@testing-library/react';

function Dummy() {
  return <h1>Hello, Test</h1>;
}

test('renders dummy component', () => {
  render(<Dummy />);
  expect(screen.getByText(/hello, test/i));
});
