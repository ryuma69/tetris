import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.Random;

public class Tetris extends JFrame {
    public static void main(String[] args) {
        if (GraphicsEnvironment.isHeadless()) {
            System.err.println("Cannot start Tetris in a headless environment. Run this on a desktop with GUI support.");
            System.exit(1);
        }

        SwingUtilities.invokeLater(() -> {
            Tetris game = new Tetris();
            game.setVisible(true);
        });
    }

    public Tetris() {
        setTitle("Simple Java Tetris");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setResizable(false);
        add(new Board());
        pack();
        setLocationRelativeTo(null);
    }
}

class Board extends JPanel {
    private static final int COLS = 10;
    private static final int ROWS = 20;
    private static final int BLOCK_SIZE = 30;
    private static final Color[] COLORS = {
        Color.BLACK,
        new Color(14, 165, 233),
        new Color(34, 197, 94),
        new Color(234, 179, 8),
        new Color(249, 115, 22),
        new Color(236, 72, 153),
        new Color(244, 63, 94),
        new Color(168, 85, 247)
    };

    private final int[][] board = new int[ROWS][COLS];
    private final Random random = new Random();
    private final Timer timer;
    private Tetromino current;
    private Tetromino next;
    private boolean paused = false;
    private boolean gameOver = false;
    private int score = 0;
    private int lines = 0;
    private int level = 1;

    public Board() {
        setPreferredSize(new Dimension(COLS * BLOCK_SIZE + 160, ROWS * BLOCK_SIZE));
        setBackground(Color.DARK_GRAY);
        setFocusable(true);
        initGame();

        timer = new Timer(500, e -> {
            if (!paused && !gameOver) {
                moveDown();
            }
        });
        timer.start();

        setupControls();
    }

    private void initGame() {
        clearBoard();
        next = randomTetromino();
        spawnPiece();
    }

    private void clearBoard() {
        for (int y = 0; y < ROWS; y++) {
            for (int x = 0; x < COLS; x++) {
                board[y][x] = 0;
            }
        }
    }

    private void setupControls() {
        InputMap im = getInputMap(WHEN_IN_FOCUSED_WINDOW);
        ActionMap am = getActionMap();

        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_LEFT, 0), "moveLeft");
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_RIGHT, 0), "moveRight");
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_DOWN, 0), "softDrop");
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_UP, 0), "rotate");
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_SPACE, 0), "hardDrop");
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_P, 0), "togglePause");

        am.put("moveLeft", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!paused && !gameOver) moveHorizontal(-1);
            }
        });
        am.put("moveRight", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!paused && !gameOver) moveHorizontal(1);
            }
        });
        am.put("softDrop", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!paused && !gameOver) moveDown();
            }
        });
        am.put("rotate", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!paused && !gameOver) rotatePiece();
            }
        });
        am.put("hardDrop", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!paused && !gameOver) hardDrop();
            }
        });
        am.put("togglePause", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                paused = !paused;
                repaint();
            }
        });
    }

    private Tetromino randomTetromino() {
        Type[] types = Type.values();
        return new Tetromino(types[random.nextInt(types.length)]);
    }

    private void spawnPiece() {
        current = next;
        current.x = COLS / 2 - current.matrix[0].length / 2;
        current.y = 0;
        next = randomTetromino();
        if (collides(current.x, current.y, current.matrix)) {
            gameOver = true;
            timer.stop();
        }
        repaint();
    }

    private boolean collides(int x, int y, int[][] shape) {
        for (int row = 0; row < shape.length; row++) {
            for (int col = 0; col < shape[row].length; col++) {
                if (shape[row][col] != 0) {
                    int boardX = x + col;
                    int boardY = y + row;
                    if (boardX < 0 || boardX >= COLS || boardY < 0 || boardY >= ROWS) {
                        return true;
                    }
                    if (board[boardY][boardX] != 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private void moveHorizontal(int delta) {
        if (!collides(current.x + delta, current.y, current.matrix)) {
            current.x += delta;
            repaint();
        }
    }

    private void moveDown() {
        if (!collides(current.x, current.y + 1, current.matrix)) {
            current.y++;
        } else {
            lockPiece();
        }
        repaint();
    }

    private void hardDrop() {
        while (!collides(current.x, current.y + 1, current.matrix)) {
            current.y++;
        }
        lockPiece();
        repaint();
    }

    private void rotatePiece() {
        int[][] rotated = current.rotated();
        if (!collides(current.x, current.y, rotated)) {
            current.matrix = rotated;
        }
        repaint();
    }

    private void lockPiece() {
        for (int row = 0; row < current.matrix.length; row++) {
            for (int col = 0; col < current.matrix[row].length; col++) {
                if (current.matrix[row][col] != 0) {
                    board[current.y + row][current.x + col] = current.matrix[row][col];
                }
            }
        }
        clearLines();
        spawnPiece();
    }

    private void clearLines() {
        int cleared = 0;
        for (int row = ROWS - 1; row >= 0; row--) {
            boolean full = true;
            for (int col = 0; col < COLS; col++) {
                if (board[row][col] == 0) {
                    full = false;
                    break;
                }
            }
            if (full) {
                cleared++;
                for (int r = row; r > 0; r--) {
                    System.arraycopy(board[r - 1], 0, board[r], 0, COLS);
                }
                for (int c = 0; c < COLS; c++) {
                    board[0][c] = 0;
                }
                row++; // re-check same row after shift
            }
        }
        if (cleared > 0) {
            lines += cleared;
            score += cleared * 100;
            level = Math.max(1, lines / 10 + 1);
            timer.setDelay(Math.max(100, 500 - (level - 1) * 35));
        }
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g;
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_OFF);

        g2d.setColor(Color.BLACK);
        g2d.fillRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);

        drawBoard(g2d);
        drawPiece(g2d, current);
        drawInfo(g2d);

        if (paused) {
            drawCenteredText(g2d, "PAUSED", 36, new Color(255, 255, 255, 180));
        }
        if (gameOver) {
            drawCenteredText(g2d, "GAME OVER", 34, new Color(255, 50, 50, 220));
        }
    }

    private void drawBoard(Graphics2D g) {
        for (int y = 0; y < ROWS; y++) {
            for (int x = 0; x < COLS; x++) {
                drawBlock(g, x, y, board[y][x]);
            }
        }
    }

    private void drawPiece(Graphics2D g, Tetromino piece) {
        for (int row = 0; row < piece.matrix.length; row++) {
            for (int col = 0; col < piece.matrix[row].length; col++) {
                if (piece.matrix[row][col] != 0) {
                    drawBlock(g, piece.x + col, piece.y + row, piece.matrix[row][col]);
                }
            }
        }
    }

    private void drawBlock(Graphics2D g, int x, int y, int value) {
        if (value == 0) {
            g.setColor(new Color(30, 30, 30));
            g.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            g.setColor(Color.GRAY);
            g.drawRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            return;
        }
        g.setColor(COLORS[value]);
        g.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        g.setColor(COLORS[value].brighter());
        g.drawRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }

    private void drawInfo(Graphics2D g) {
        int startX = COLS * BLOCK_SIZE + 20;
        int startY = 40;
        g.setColor(Color.WHITE);
        g.setFont(new Font("SansSerif", Font.BOLD, 16));
        g.drawString("Score:", startX, startY);
        g.drawString(String.valueOf(score), startX, startY + 24);
        g.drawString("Lines:", startX, startY + 64);
        g.drawString(String.valueOf(lines), startX, startY + 88);
        g.drawString("Level:", startX, startY + 128);
        g.drawString(String.valueOf(level), startX, startY + 152);

        g.drawString("Next:", startX, startY + 202);
        drawNextPiece(g, startX, startY + 210);
        g.setFont(new Font("SansSerif", Font.PLAIN, 12));
        g.drawString("← →: move", startX, startY + 340);
        g.drawString("↓: soft drop", startX, startY + 360);
        g.drawString("↑: rotate", startX, startY + 380);
        g.drawString("Space: hard drop", startX, startY + 400);
        g.drawString("P: pause", startX, startY + 420);
    }

    private void drawNextPiece(Graphics2D g, int x, int y) {
        int boxSize = BLOCK_SIZE - 6;
        int offsetX = x + 6;
        int offsetY = y + 12;
        for (int row = 0; row < next.matrix.length; row++) {
            for (int col = 0; col < next.matrix[row].length; col++) {
                int value = next.matrix[row][col];
                if (value != 0) {
                    g.setColor(COLORS[value]);
                    g.fillRect(offsetX + col * boxSize, offsetY + row * boxSize, boxSize, boxSize);
                    g.setColor(COLORS[value].brighter());
                    g.drawRect(offsetX + col * boxSize, offsetY + row * boxSize, boxSize, boxSize);
                }
            }
        }
    }

    private void drawCenteredText(Graphics2D g, String text, int fontSize, Color color) {
        g.setFont(new Font("SansSerif", Font.BOLD, fontSize));
        FontMetrics fm = g.getFontMetrics();
        int textWidth = fm.stringWidth(text);
        int textHeight = fm.getAscent();
        g.setColor(color);
        g.drawString(text, (COLS * BLOCK_SIZE - textWidth) / 2, (ROWS * BLOCK_SIZE + textHeight) / 2);
    }
}

class Tetromino {
    int x;
    int y;
    int[][] matrix;

    Tetromino(Type type) {
        matrix = type.shape;
    }

    int[][] rotated() {
        int size = matrix.length;
        int[][] result = new int[size][size];
        for (int row = 0; row < size; row++) {
            for (int col = 0; col < size; col++) {
                result[col][size - row - 1] = matrix[row][col];
            }
        }
        return result;
    }
}

enum Type {
    I(new int[][] { {0, 0, 0, 0}, {1, 1, 1, 1}, {0, 0, 0, 0}, {0, 0, 0, 0} }),
    J(new int[][] { {2, 0, 0}, {2, 2, 2}, {0, 0, 0} }),
    L(new int[][] { {0, 0, 3}, {3, 3, 3}, {0, 0, 0} }),
    O(new int[][] { {4, 4}, {4, 4} }),
    S(new int[][] { {0, 5, 5}, {5, 5, 0}, {0, 0, 0} }),
    T(new int[][] { {0, 6, 0}, {6, 6, 6}, {0, 0, 0} }),
    Z(new int[][] { {7, 7, 0}, {0, 7, 7}, {0, 0, 0} });

    final int[][] shape;

    Type(int[][] shape) {
        this.shape = shape;
    }
}
