import os

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def display_board(board):
    clear_screen()
    print("\n  Tic-Tac-Toe Game")
    print("----------------")
    print(f"| {board[7]} | {board[8]} | {board[9]} |")
    print("----------------")
    print(f"| {board[4]} | {board[5]} | {board[6]} |")
    print("----------------")
    print(f"| {board[1]} | {board[2]} | {board[3]} |")
    print("----------------\n")

def check_win(board, player):
    win_conditions = [
        (7, 8, 9), (4, 5, 6), (1, 2, 3), # Rows
        (7, 4, 1), (8, 5, 2), (9, 6, 3), # Columns
        (7, 5, 3), (9, 5, 1)             # Diagonals
    ]
    for condition in win_conditions:
        if all(board[i] == player for i in condition):
            return True
    return False

def check_draw(board):
    return all(board[i] in ('X', 'O') for i in range(1, 10))

def play_game():
    board = [' '] * 10
    current_player = 'X'
    game_on = True

    while game_on:
        display_board(board)
        try:
            position = int(input(f"Player {current_player}, choose a position (1-9): "))
        except ValueError:
            print("Invalid input! Please enter a number between 1 and 9.")
            continue

        if position in range(1, 10) and board[position] == ' ':
            board[position] = current_player
            if check_win(board, current_player):
                display_board(board)
                print(f"🎉 Player {current_player} wins! Congratulations, Sir! 🎉")
                game_on = False
            elif check_draw(board):
                display_board(board)
                print("🤝 It's a draw! 🤝")
                game_on = False
            else:
                current_player = 'O' if current_player == 'X' else 'X'
        else:
            print("This spot is already taken or invalid! Try again.")

if __name__ == "__main__":
    print("Welcome to Tic-Tac-Toe!")
    play_game()
