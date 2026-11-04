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
 * Servlet for processing Add Skill form submissions.
 * Connects to MySQL database and uses Prepared Statements.
 */
@WebServlet("/add-skill")
public class AddSkillServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // Database connection details for XAMPP MySQL
    private static final String DB_URL = "jdbc:mysql://localhost:3306/skillswap?useSSL=false&allowPublicKeyRetrieval=true";
    private static final String DB_USER = "root";
    private static final String DB_PASS = "";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String studentIdStr = request.getParameter("student_id");
        String skillName = request.getParameter("skill_name");
        String skillType = request.getParameter("skill_type"); // 'TEACH' or 'LEARN'
        String description = request.getParameter("description");

        // Basic Validation
        if (studentIdStr == null || skillName == null || skillType == null ||
            studentIdStr.trim().isEmpty() || skillName.trim().isEmpty() || skillType.trim().isEmpty()) {
            response.sendRedirect("http://localhost/skillswap/index.php?error=missing_fields");
            return;
        }

        try {
            int studentId = Integer.parseInt(studentIdStr.trim());

            // Load JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            // Execute Prepared SQL Statement
            String sql = "INSERT INTO skills (student_id, skill_name, skill_type, description) VALUES (?, ?, ?, ?)";
            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
                 PreparedStatement stmt = conn.prepareStatement(sql)) {

                stmt.setInt(1, studentId);
                stmt.setString(2, skillName.trim());
                stmt.setString(3, skillType.trim().toUpperCase());
                stmt.setString(4, description != null ? description.trim() : "");

                stmt.executeUpdate();
            }

            // Redirect back to PHP platform
            response.sendRedirect("http://localhost/skillswap/index.php?msg=skill_added");

        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("http://localhost/skillswap/index.php?error=db_error");
        }
    }
}
