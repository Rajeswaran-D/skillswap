import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet for processing Exchange Requests (Send, Accept, Reject).
 * Connects to MySQL database and uses Prepared Statements.
 */
@WebServlet("/process-request")
public class ProcessRequestServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // Database connection details for XAMPP MySQL
    private static final String DB_URL = "jdbc:mysql://localhost:3306/skillswap?useSSL=false&allowPublicKeyRetrieval=true";
    private static final String DB_USER = "root";
    private static final String DB_PASS = "";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        String action = request.getParameter("action");

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");

            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {

                // 1. Send Exchange Request
                if ("send".equalsIgnoreCase(action)) {
                    int senderId = Integer.parseInt(request.getParameter("sender_id"));
                    int receiverId = Integer.parseInt(request.getParameter("receiver_id"));
                    int skillId = Integer.parseInt(request.getParameter("skill_id"));
                    String message = request.getParameter("message");

                    String sql = "INSERT INTO requests (sender_id, receiver_id, skill_id, message, status) VALUES (?, ?, ?, ?, 'PENDING')";
                    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                        stmt.setInt(1, senderId);
                        stmt.setInt(2, receiverId);
                        stmt.setInt(3, skillId);
                        stmt.setString(4, message != null ? message.trim() : "");
                        stmt.executeUpdate();
                    }
                    response.sendRedirect("http://localhost/skillswap/index.php?msg=request_sent");
                    return;
                }

                // 2. Accept Exchange Request
                else if ("accept".equalsIgnoreCase(action)) {
                    int requestId = Integer.parseInt(request.getParameter("request_id"));
                    int receiverId = Integer.parseInt(request.getParameter("receiver_id"));

                    String sql = "UPDATE requests SET status = 'ACCEPTED' WHERE id = ? AND receiver_id = ?";
                    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                        stmt.setInt(1, requestId);
                        stmt.setInt(2, receiverId);
                        stmt.executeUpdate();
                    }
                    response.sendRedirect("http://localhost/skillswap/index.php?msg=request_accepted");
                    return;
                }

                // 3. Reject Exchange Request
                else if ("reject".equalsIgnoreCase(action)) {
                    int requestId = Integer.parseInt(request.getParameter("request_id"));
                    int receiverId = Integer.parseInt(request.getParameter("receiver_id"));

                    String sql = "UPDATE requests SET status = 'REJECTED' WHERE id = ? AND receiver_id = ?";
                    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                        stmt.setInt(1, requestId);
                        stmt.setInt(2, receiverId);
                        stmt.executeUpdate();
                    }
                    response.sendRedirect("http://localhost/skillswap/index.php?msg=request_rejected");
                    return;
                }
            }

            response.sendRedirect("http://localhost/skillswap/index.php");

        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("http://localhost/skillswap/index.php?error=request_error");
        }
    }
}
