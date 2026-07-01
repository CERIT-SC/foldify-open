from config import Config

# Display name shown as the email sender, instead of the raw EMAIL_FROM address (e.g. root@host).
FROM_DISPLAY_NAME = "Foldify"

# Shown at the end of every "computation has finished" email. Keeping it here
# means updating the citation (or the email format) is a one-file change.
CITATION_NOTICE = (
    "If you use results generated with Foldify in your research, please cite:\n"
    "Ďuráčiová, R.; Capandová, M.; Berka, K.; Svobodová, R.; Slanináková, T.; "
    "Kováč, K.; Antol, M.; Hejtmánek, L. Foldify: Web Application for Protein "
    "Structure Prediction. J. Chem. Inf. Model. 2026. doi.org/10.1021/acs.jcim.6c01154"
)


def _escape(text):
    """Turn real newlines into the literal '\\n' sequence 'echo -e' expects."""
    return text.replace("\n", "\\n")


def _header(email_quoted, subject):
    return f'To:{email_quoted}\\nFrom:{FROM_DISPLAY_NAME} <{Config.EMAIL_FROM}>\\nSubject:{_escape(subject)}\\n\\n'


def success_email_cmd(email_quoted, subject, message):
    """Build the ssmtp command for a successful-job email, citation notice included."""
    body = _escape(f'{message}\n\n{CITATION_NOTICE}')
    return f'echo -e "{_header(email_quoted, subject)}{body}\\n" | ssmtp -t'


def failure_email_cmd(email_quoted, subject, message, stdout_path):
    """Build the ssmtp command for a failed-job email, piping in the job's stdout log."""
    return (
        f'echo -e "{_header(email_quoted, subject)}{_escape(message)}\\n" '
        f'| cat - {stdout_path} | ssmtp -t'
    )
