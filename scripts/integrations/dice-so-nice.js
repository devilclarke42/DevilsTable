/** Client-local presentation only. Never receives the hidden DC, outcome or merchant state. */
export const diceSoNiceAdapter = {
  id: "dice-so-nice", moduleId: "dice-so-nice", name: "Dice So Nice", actions: {},
  available: () => typeof game.dice3d?.showForRoll === "function",
  clientActions: {
    roll: ({ roll }) => game.dice3d.showForRoll(roll, game.user, false, [game.user.id], false)
  }
};
