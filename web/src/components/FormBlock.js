import { Field } from 'react-final-form';
import Select from 'react-select';

export const error = meta => (meta.touched && meta.error ? 'is-invalid' : '');

export function ErrorBlock({ name }) {

	return (
		<Field
			name={name}
			subscription={{ touched: true, error: true }}
			render={({ meta: { touched, error } }) =>
				touched && error ? (
					<div type="invalid" className="invalid-feedback">
						{error}
					</div>
				) : null
			}
		/>
	);
}

export function FormSubmitError({ error }) {
	return (
		error &&
		error !== '' && (
			<div
				className="alert alert-danger border-0"
				style={{ padding: '0.48rem 1.2rem' }}
				dangerouslySetInnerHTML={{
					__html: `<strong>Error!</strong> ${error}`,
				}}
			/>
		)
	);
}

export function resetForm(form, values) {
	Object.keys(values).forEach(key => {
		form.change(key, undefined);
		form.resetFieldState(key);
	});
}

export function Compulsory() {
	return <span className="compulsory-field">*</span>;
}

export function ReactSelectAdapter({ input, ...rest }) {
	return <Select {...input} {...rest} searchable />;
}

export function Condition({ when, is, children }) {
	return (
		<Field name={when} subscription={{ value: true }}>
			{({ input: { value } }) => (value === is ? children : null)}
		</Field>
	);
}

export function ConditionNot({ when, isNot, children }) {
	return (
		<Field name={when} subscription={{ value: true }}>
			{({ input: { value } }) => (value !== isNot ? children : null)}
		</Field>
	);
}
