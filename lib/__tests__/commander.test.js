/* eslint-env jest */
import Client from '../client';
import Commander from '../commander';

describe('Commander', () => {
  it('should allow chaining methods', () => {
    const methods = [];
    const client = new Client('address');
    // eslint-disable-next-line func-names
    client.keypress = function (command) {
      methods.push(command);
      return Promise.resolve();
    };
    const commander = new Commander(client);

    return commander
      .up(2)
      .down(2)
      .left()
      .right()
      .left()
      .right()
      .text('b')
      .text('a')
      .enter()
      .send()
      .then(() => {
        expect(methods).toEqual([
          'Up',
          'Up',
          'Down',
          'Down',
          'Left',
          'Right',
          'Left',
          'Right',
          'b',
          'a',
          'Enter',
        ]);
      });
  });
});
